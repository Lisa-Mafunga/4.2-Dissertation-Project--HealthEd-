// The following imports use Deno/npm resolution at runtime; add ts-ignore so local TS checks don't fail
// @ts-ignore
import { Hono } from "npm:hono";
// @ts-ignore
import { cors } from "npm:hono/cors";
// @ts-ignore
import { logger } from "npm:hono/logger";
// @ts-ignore
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  // prefer Deno.env when available, otherwise fall back to process.env (for local checking)
  (globalThis as any).Deno?.env?.get('SUPABASE_URL') || (globalThis as any).process?.env?.SUPABASE_URL!,
  (globalThis as any).Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') || (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY!,
);

// helper to stringify unknown errors safely
function safeErrorMessage(e: any) {
  return (e && (e.message || e.toString())) || String(e);
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to generate unique IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Health check endpoint
app.get("/make-server-565696a6/health", (c: any) => {
  return c.json({ status: "ok" });
});

// Authentication endpoints
app.post("/make-server-565696a6/auth/signup", async (c: any) => {
  try {
    const { regNumber, username, password, userType } = await c.req.json();
    console.log('Signup attempt:', { regNumber, username, userType });
    
    // Only students can sign up - healthcare professionals are already in the database
    if (userType !== 'student') {
      return c.json({ 
        error: "Only students can sign up. Healthcare professionals should login with their assigned credentials." 
      }, 400);
    }
    
    // Validate registration number in students table
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('registration_number', regNumber)
      .single();
    
    if (studentError || !studentData) {
      console.log('Student validation error:', studentError);
      return c.json({ 
        error: "Registration number not found. Please contact administration if you believe this is an error." 
      }, 400);
    }
    
    console.log('Valid student found:', studentData);
    
    // Check if username already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      return c.json({ error: "Username already exists. Please choose a different username." }, 400);
    }
    
    // Check if this registration number is already used
    const { data: existingRegUser } = await supabase
      .from('users')
      .select('registration_number')
      .eq('registration_number', regNumber)
      .single();
    
    if (existingRegUser) {
      return c.json({ error: "This registration number is already registered. Please login instead." }, 400);
    }
    
    // Create user in users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        username,
        password,
        user_type: userType,
        registration_number: regNumber,
        full_name: studentData.name || username,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (insertError || !newUser) {
      console.error('User creation error:', insertError);
      return c.json({ error: "Failed to create user account. Please try again." }, 500);
    }
    
    console.log('User created successfully:', newUser);
    
    return c.json({ 
      success: true, 
      user: {
        username: newUser.username,
        userType: newUser.user_type,
        name: newUser.full_name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: `Signup failed: ${safeErrorMessage(error)}` }, 500);
  }
});

app.post("/make-server-565696a6/auth/login", async (c: any) => {
  try {
    const { username, password } = await c.req.json();
    console.log('Login attempt for username:', username);
    
    // Query users table for authentication
    const { data: user, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (loginError || !user) {
      console.log('Login error:', loginError);
      return c.json({ error: "Invalid username or password" }, 401);
    }
    
    console.log('Login successful for user:', user.username, 'user_type from DB:', user.user_type);
    
    // Normalize user type to match frontend expectations
    let normalizedUserType = user.user_type;
    if (user.user_type === 'healthcare_professional' || user.user_type === 'Healthcare Professional') {
      normalizedUserType = 'healthcare';
    } else if (user.user_type === 'Student') {
      normalizedUserType = 'student';
    }
    
    console.log('Normalized user type:', normalizedUserType);
    
    return c.json({ 
      success: true, 
      user: {
        username: user.username,
        userType: normalizedUserType,
        name: user.full_name || user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: `Login failed: ${safeErrorMessage(error)}` }, 500);
  }
});

// Resources endpoints
app.get("/make-server-565696a6/resources", async (c: any) => {
  try {
    const category = c.req.query('category');
    const type = c.req.query('type');
    const search = c.req.query('search');
    const uploadedBy = c.req.query('uploadedBy');
    
    let resources = await kv.get('resources') || [];
    
    if (category && category !== 'All') {
      resources = resources.filter((r: any) => r.category === category);
    }
    
    if (type && type !== 'All') {
      resources = resources.filter((r: any) => r.type === type);
    }
    
    if (uploadedBy) {
      resources = resources.filter((r: any) => r.uploadedBy === uploadedBy);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      resources = resources.filter((r: any) => 
        r.title.toLowerCase().includes(searchLower) || 
        r.description.toLowerCase().includes(searchLower)
      );
    }
    
    return c.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    return c.json({ error: "Failed to get resources" }, 500);
  }
});

app.post("/make-server-565696a6/resources", async (c: any) => {
  try {
    const resourceData = await c.req.json();
    
    const resources = await kv.get('resources') || [];
    const newResource = {
      id: generateId(),
      ...resourceData,
      createdAt: new Date().toISOString()
    };
    
    resources.push(newResource);
    await kv.set('resources', resources);
    
    return c.json({ success: true, resource: newResource });
  } catch (error) {
    console.error('Create resource error:', error);
    return c.json({ error: "Failed to create resource" }, 500);
  }
});

app.put("/make-server-565696a6/resources/:id", async (c: any) => {
  try {
    const resourceId = c.req.param('id');
    const resourceData = await c.req.json();
    
    const resources = await kv.get('resources') || [];
    const index = resources.findIndex((r: any) => r.id === resourceId);
    
    if (index === -1) {
      return c.json({ error: "Resource not found" }, 404);
    }
    
    resources[index] = { ...resources[index], ...resourceData };
    await kv.set('resources', resources);
    
    return c.json({ success: true, resource: resources[index] });
  } catch (error) {
    console.error('Update resource error:', error);
    return c.json({ error: "Failed to update resource" }, 500);
  }
});

app.delete("/make-server-565696a6/resources/:id", async (c: any) => {
  try {
    const resourceId = c.req.param('id');
    
    const resources = await kv.get('resources') || [];
    const filtered = resources.filter((r: any) => r.id !== resourceId);
    
    await kv.set('resources', filtered);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete resource error:', error);
    return c.json({ error: "Failed to delete resource" }, 500);
  }
});

// Educational Modules endpoints (using KV store)
app.get("/make-server-565696a6/modules", async (c: any) => {
  try {
    const modules = await kv.get('educational_modules') || [];
    return c.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

app.post("/make-server-565696a6/modules", async (c: any) => {
  try {
    const moduleData = await c.req.json();
    
    const modules = await kv.get('educational_modules') || [];
    const newModule = {
      id: generateId(),
      title: moduleData.title,
      description: moduleData.description,
      category: moduleData.category,
      duration: moduleData.duration,
      difficulty: moduleData.difficulty,
      content_type: moduleData.contentType || 'link',
      content_url: moduleData.contentUrl || moduleData.url,
      uploaded_by: moduleData.uploadedBy,
      created_at: new Date().toISOString()
    };
    
    modules.unshift(newModule);
    await kv.set('educational_modules', modules);
    
    return c.json({ success: true, module: newModule });
  } catch (error) {
    console.error('Create module error:', error);
    return c.json({ error: "Failed to create module" }, 500);
  }
});

app.put("/make-server-565696a6/modules/:id", async (c: any) => {
  try {
    const moduleId = c.req.param('id');
    const moduleData = await c.req.json();
    
    const modules = await kv.get('educational_modules') || [];
    const moduleIndex = modules.findIndex((m: any) => m.id === moduleId);
    
    if (moduleIndex === -1) {
      return c.json({ error: "Module not found" }, 404);
    }
    
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      title: moduleData.title,
      description: moduleData.description,
      category: moduleData.category,
      duration: moduleData.duration,
      difficulty: moduleData.difficulty,
      content_type: moduleData.contentType,
      content_url: moduleData.contentUrl
    };
    
    await kv.set('educational_modules', modules);
    
    return c.json({ success: true, module: modules[moduleIndex] });
  } catch (error) {
    console.error('Update module error:', error);
    return c.json({ error: "Failed to update module" }, 500);
  }
});

app.delete("/make-server-565696a6/modules/:id", async (c: any) => {
  try {
    const moduleId = c.req.param('id');
    
    const modules = await kv.get('educational_modules') || [];
    const filtered = modules.filter((m: any) => m.id !== moduleId);
    
    await kv.set('educational_modules', filtered);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete module error:', error);
    return c.json({ error: "Failed to delete module" }, 500);
  }
});

// Course progress tracking
app.get("/make-server-565696a6/course-progress/:username", async (c: any) => {
  try {
    const username = c.req.param('username');
    const allProgress = await kv.get('course_progress') || {};
    
    return c.json({ progress: allProgress[username] || [] });
  } catch (error) {
    console.error('Get course progress error:', error);
    return c.json({ error: "Failed to get course progress" }, 500);
  }
});

app.post("/make-server-565696a6/course-progress", async (c: any) => {
  try {
    const { username, courseId, progress, completed } = await c.req.json();
    
    const allProgress = await kv.get('course_progress') || {};
    if (!allProgress[username]) {
      allProgress[username] = [];
    }
    
    const existingIndex = allProgress[username].findIndex((p: any) => p.courseId === courseId);
    
    const progressData = {
      courseId,
      progress,
      completed: completed || false,
      lastAccessed: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      allProgress[username][existingIndex] = progressData;
    } else {
      allProgress[username].push(progressData);
    }
    
    await kv.set('course_progress', allProgress);
    
    return c.json({ success: true, progress: progressData });
  } catch (error) {
    console.error('Course progress error:', error);
    return c.json({ error: "Failed to save course progress" }, 500);
  }
});

// Community endpoints
app.get("/make-server-565696a6/community/channels", async (c: any) => {
  try {
    const channels = await kv.get('community_channels') || [];
    return c.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

app.get("/make-server-565696a6/community/posts/:channelId", async (c: any) => {
  try {
    const channelId = c.req.param('channelId');
    const allPosts = await kv.get('community_posts') || {};
    
    return c.json({ posts: allPosts[channelId] || [] });
  } catch (error) {
    console.error('Get posts error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

app.post("/make-server-565696a6/community/posts", async (c: any) => {
  try {
    const { channelId, title, content, author } = await c.req.json();
    
    const allPosts = await kv.get('community_posts') || {};
    if (!allPosts[channelId]) {
      allPosts[channelId] = [];
    }
    
    const newPost = {
      id: generateId(),
      channelId,
      title,
      content,
      author,
      likes: 0,
      replies: 0,
      createdAt: new Date().toISOString()
    };
    
    allPosts[channelId].unshift(newPost);
    await kv.set('community_posts', allPosts);
    
    // Update channel posts count
    const channels = await kv.get('community_channels') || [];
    const channelIndex = channels.findIndex((ch: any) => ch.id === parseInt(channelId));
    if (channelIndex >= 0) {
      channels[channelIndex].posts = (channels[channelIndex].posts || 0) + 1;
      await kv.set('community_channels', channels);
    }
    
    return c.json({ success: true, post: newPost });
  } catch (error) {
    console.error('Create post error:', error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// Post likes
app.post("/make-server-565696a6/community/posts/:postId/like", async (c: any) => {
  try {
    const postId = c.req.param('postId');
    const { username, channelId } = await c.req.json();
    
    const allLikes = await kv.get('post_likes') || {};
    const likeKey = `${postId}-${username}`;
    
    const allPosts = await kv.get('community_posts') || {};
    const posts = allPosts[channelId] || [];
    const postIndex = posts.findIndex((p: any) => p.id === postId);
    
    if (postIndex === -1) {
      return c.json({ error: "Post not found" }, 404);
    }
    
    if (allLikes[likeKey]) {
      // Unlike
      delete allLikes[likeKey];
      posts[postIndex].likes = Math.max(0, (posts[postIndex].likes || 0) - 1);
      
      await kv.set('post_likes', allLikes);
      allPosts[channelId] = posts;
      await kv.set('community_posts', allPosts);
      
      return c.json({ success: true, liked: false });
    } else {
      // Like
      allLikes[likeKey] = { postId, username, createdAt: new Date().toISOString() };
      posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
      
      await kv.set('post_likes', allLikes);
      allPosts[channelId] = posts;
      await kv.set('community_posts', allPosts);
      
      return c.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

// Get post replies
app.get("/make-server-565696a6/community/posts/:postId/replies", async (c: any) => {
  try {
    const postId = c.req.param('postId');
    const allReplies = await kv.get('post_replies') || {};

    return c.json({ replies: allReplies[postId] || [] });
  } catch (error) {
    console.error('Get replies error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

// Add post reply
app.post("/make-server-565696a6/community/posts/:postId/replies", async (c: any) => {
  try {
    const postId = c.req.param('postId');
    const { content, author, channelId } = await c.req.json();

    const allReplies = await kv.get('post_replies') || {};
    if (!allReplies[postId]) {
      allReplies[postId] = [];
    }

    const newReply = {
      id: generateId(),
      postId,
      content,
      author,
      createdAt: new Date().toISOString()
    };

    allReplies[postId].push(newReply);
    await kv.set('post_replies', allReplies);

    // Update post replies count
    const allPosts = await kv.get('community_posts') || {};
    const posts = allPosts[channelId] || [];
    const postIndex = posts.findIndex((p: any) => p.id === postId);

    if (postIndex >= 0) {
      posts[postIndex].replies = (posts[postIndex].replies || 0) + 1;
      allPosts[channelId] = posts;
      await kv.set('community_posts', allPosts);
    }

    return c.json({ success: true, reply: newReply });
  } catch (error) {
    console.error('Create reply error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

// Check if user liked a post
app.get("/make-server-565696a6/community/posts/:postId/liked/:username", async (c: any) => {
  try {
    const postId = c.req.param('postId');
    const username = c.req.param('username');

    const allLikes = await kv.get('post_likes') || {};
    const likeKey = `${postId}-${username}`;

    return c.json({ liked: !!allLikes[likeKey] });
  } catch (error) {
    return c.json({ liked: false });
  }
});

// Statistics endpoints
app.get("/make-server-565696a6/stats/healthcare/:username", async (c: any) => {
  try {
    const username = c.req.param('username');
    
    const questions = await kv.get('qa_questions') || [];
    const resources = await kv.get('resources') || [];
    
    const answeredByUser = questions.filter((q: any) => q.answeredBy === username && q.status === 'answered');
    const totalAnswered = questions.filter((q: any) => q.status === 'answered');
    const userResources = resources.filter((r: any) => r.uploadedBy === username);
    
    // Get modules from KV store
    const allModules = await kv.get('educational_modules') || [];
    const modules = allModules.filter((m: any) => m.uploaded_by === username);
    
    // Calculate topic breakdown for questions answered
    const topicBreakdown: Record<string, number> = {};
    answeredByUser.forEach((q: any) => {
      const category = q.category || 'General Health';
      topicBreakdown[category] = (topicBreakdown[category] || 0) + 1;
    });
    
    return c.json({
      success: true,
      questionsAnsweredByUser: answeredByUser.length,
      totalQuestionsAnswered: totalAnswered.length,
      resourcesUploaded: userResources.length,
      modulesUploaded: modules.length,
      topicBreakdown
    });
  } catch (error) {
    console.error('Get healthcare stats error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

app.get("/make-server-565696a6/stats/student/:username", async (c: any) => {
  try {
    const username = c.req.param('username');
    
    const allProgress = await kv.get('course_progress') || {};
    const userProgress = allProgress[username] || [];
    const completedCourses = userProgress.filter((p: any) => p.completed).length;
    
    // Count community posts by this user
    const allPosts = await kv.get('community_posts') || {};
    let userPostsCount = 0;
    Object.values(allPosts).forEach((posts: any) => {
      if (Array.isArray(posts)) {
        userPostsCount += posts.filter((p: any) => p.author === username).length;
      }
    });
    
    // Count questions asked
    const questions = await kv.get('qa_questions') || [];
    const userQuestions = questions.filter((q: any) => q.askedBy === username);
    
    // Get total modules count
    const modules = await kv.get('educational_modules') || [];
    const totalModules = modules.length;
    
    return c.json({
      success: true,
      modulesCompleted: `${completedCourses}/${totalModules || userProgress.length || 0}`,
      communityPosts: userPostsCount,
      questionsAsked: userQuestions.length,
      resourcesSaved: 0
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

// Q&A endpoints
app.get("/make-server-565696a6/qa/questions", async (c: any) => {
  try {
    const questions = await kv.get('qa_questions') || [];
    return c.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

app.post("/make-server-565696a6/qa/questions", async (c: any) => {
  try {
    const { question, category } = await c.req.json();

    const questions = await kv.get('qa_questions') || [];
    const newQuestion = {
      id: generateId(),
      question,
      category: category || 'General Health',
      status: 'pending',
      answer: null,
      answeredBy: null,
      answeredAt: null,
      createdAt: new Date().toISOString()
    };

    questions.unshift(newQuestion);
    await kv.set('qa_questions', questions);

    return c.json({ success: true, question: newQuestion });
  } catch (error) {
    console.error('Create question error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

app.post("/make-server-565696a6/qa/answer", async (c: any) => {
  try {
    const { questionId, answer, answeredBy } = await c.req.json();

    const questions = await kv.get('qa_questions') || [];
    const questionIndex = questions.findIndex((q: any) => q.id === questionId);

    if (questionIndex === -1) {
      return c.json({ error: "Question not found" }, 404);
    }

    questions[questionIndex].answer = answer;
    questions[questionIndex].answeredBy = answeredBy;
    questions[questionIndex].status = 'answered';
    questions[questionIndex].answeredAt = new Date().toISOString();

    await kv.set('qa_questions', questions);

    return c.json({ success: true, question: questions[questionIndex] });
  } catch (error) {
    console.error('Answer question error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

// Database info endpoint for testing
app.get("/make-server-565696a6/database/info", async (c: any) => {
  try {
    // Check students table
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(5);
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('username, user_type, registration_number')
      .limit(5);
    
    const tables: Record<string, string> = {
      students: studentsError ? `Error: ${studentsError.message}` : `✓ Connected (${students?.length || 0} records found)`,
      users: usersError ? `Error: ${usersError.message}` : `✓ Connected (${users?.length || 0} records found)`
    };
    
    return c.json({ 
      success: true,
      tables,
      sampleData: {
        students: students || [],
        users: users || []
      }
    });
  } catch (error) {
    console.error('Database info error:', error);
    return c.json({ 
      success: false,
      error: safeErrorMessage(error)
    }, 500);
  }
});

// Initialize default data (only for community channels)
app.post("/make-server-565696a6/init-data", async (c: any) => {
  try {
    // Initialize community channels in KV store
    const existingChannels = await kv.get('community_channels');
    if (!existingChannels || existingChannels.length === 0) {
      const defaultChannels = [
        { id: 1, name: 'General Discussion', description: 'General sexual health topics', posts: 0, members: 0 },
        { id: 2, name: 'Relationships', description: 'Healthy relationships and communication', posts: 0, members: 0 },
        { id: 3, name: 'STI Prevention', description: 'STI awareness and prevention', posts: 0, members: 0 },
        { id: 4, name: 'Mental Health', description: 'Mental health and sexuality', posts: 0, members: 0 },
        { id: 5, name: 'LGBTQ+ Support', description: 'Safe space for LGBTQ+ students', posts: 0, members: 0 }
      ];
      await kv.set('community_channels', defaultChannels);
    }
    
    // Note: Students and users tables are managed directly in Supabase, not in KV store
    
    return c.json({ success: true, message: 'Default data initialized' });
  } catch (error) {
    console.error('Init data error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

// Initialize community channels specifically
app.post("/make-server-565696a6/init-channels", async (c: any) => {
  try {
    const defaultChannels = [
      { id: 1, name: 'General Discussion', description: 'General sexual health topics', posts: 0, members: 0 },
      { id: 2, name: 'Relationships', description: 'Healthy relationships and communication', posts: 0, members: 0 },
      { id: 3, name: 'STI Prevention', description: 'STI awareness and prevention', posts: 0, members: 0 },
      { id: 4, name: 'Mental Health', description: 'Mental health and sexuality', posts: 0, members: 0 },
      { id: 5, name: 'LGBTQ+ Support', description: 'Safe space for LGBTQ+ students', posts: 0, members: 0 }
    ];
    await kv.set('community_channels', defaultChannels);
    
    return c.json({ success: true, message: 'Community channels initialized' });
  } catch (error) {
    console.error('Init channels error:', error);
    return c.json({ error: safeErrorMessage(error) }, 500);
  }
});

// Guard Deno.serve so local type-checking doesn't error when Deno isn't available
(globalThis as any).Deno?.serve?.(app.fetch);