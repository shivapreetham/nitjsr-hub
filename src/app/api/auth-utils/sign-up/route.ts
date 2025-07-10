import prisma from '@/lib/prismadb';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmails';

// Email pattern to extract information
const EMAIL_PATTERN = /^(\d{4})(ug|pg)([a-z]+)\d+@nitjsr\.ac\.in$/i;

// Maps for branch and course information
const branchMap = {
  ug: 'Undergraduate',
  pg: 'Postgraduate',
};

const courseMap = {
  cs: 'Computer Science and Engineering',
  ec: 'Electronics and Communication Engineering',
  ee: 'Electrical Engineering',
  ce: 'Civil Engineering',
  me: 'Mechanical Engineering',
  mm: 'Metallurgical and Materials Engineering',
  pi: 'Production and Industrial Engineering',
  csca: 'Master in Computer Applications',
  phd: 'PhD',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body) {
      return Response.json(
        { success: false, message: 'No request body provided' },
        { status: 400 }
      );
    }

    const { username, email, password, NITUsername, NITPassword } = body;

    // Validate required fields
    if (!username || !email || !password || !NITUsername || !NITPassword) {
      return Response.json(
        { 
          success: false, 
          message: 'Missing required fields. Please fill in all fields.' 
        },
        { status: 400 }
      );
    }
    
    // Parse email to extract batch, branch, and course
    const emailMatch = email.match(EMAIL_PATTERN);
    
    let batch = null;
    let branch = null;
    let course = null;
    
    if (emailMatch) {
      const [, batchValue, branchCode, courseCode] = emailMatch;
      
      batch = batchValue;
      branch = branchMap[branchCode.toLowerCase() as keyof typeof branchMap] || branchCode.toUpperCase();
      course = courseMap[courseCode.toLowerCase() as keyof typeof courseMap] || courseCode.toUpperCase();
    }

    // Check if user exists with verified username
    const existingVerifiedUserByUsername = await prisma.user.findFirst({
      where: {
        username,
        isVerified: true,
      },
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        { success: false, message: 'Username already exists. Please choose another username.' },
        { status: 400 }
      );
    }
    
    // Check if user exists with the same email
    const existingUserByEmail = await prisma.user.findFirst({
      where: { email },
    });
    
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    let userId;

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: 'An account with this email already exists. Please sign in instead.' },
          { status: 400 }
        );
      } else {
        // Update existing unverified user
        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            username,
            email,
            hashedPassword,
            NITUsername,
            NITPassword,
            verifyCode,
            verifyCodeExpiry: new Date(Date.now() + 3600000),
            isVerified: false,
            isAcceptingAnonymousMessages: true,
            batch,
            branch,
            course
          },
        });
        
        userId = updatedUser.id;
      }
    } else {
      // Create new user if email doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry

      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          hashedPassword,
          NITUsername,
          NITPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingAnonymousMessages: true,
          batch,
          branch,
          course
        },
      });
      
      userId = newUser.id;
    }

    // Send verification email
    try {
      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );

      if (!emailResponse.success) {
        console.error('Error sending verification email:', emailResponse.message);
        // Don't prevent account creation if email fails
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'An unexpected error occurred during email verification. subscription limit reached. Please try again.' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Trigger attendance processing in the background (non-blocking)
    setTimeout(async () => {
      try {
        await fetch(
          'https://testserver-hrna.onrender.com/userSpecific',
          { 
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Attendance processing initiated for new user:', email);
      } catch (attendanceError) {
        console.error('Error initiating attendance processing:', attendanceError);
      }
    }, 0);

    return Response.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email for the verification code.',
        userId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An unexpected error occurred during registration. Please try again.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}