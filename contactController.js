const Message = require('../models/Message');
const sendEmail = require('../utils/sendEmail');

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
exports.sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Save to DB
    const newMessage = await Message.create({ name, email, subject, message });

    // Email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `📬 Portfolio Contact: ${subject}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-bottom: 4px;">New Contact Message</h2>
          <hr style="border: 1px solid #e2e8f0; margin-bottom: 20px;" />
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 100px;">Name:</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Subject:</td><td style="padding: 8px 0;">${subject}</td></tr>
          </table>
          <div style="background: #fff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 16px;">
            <p style="margin: 0; line-height: 1.7;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">Sent from your Portfolio Contact Form</p>
        </div>
      `,
    }).catch(err => console.error('Email send failed:', err.message));

    // Auto-reply to sender
    await sendEmail({
      to: email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thanks for your message!</h2>
          <p>Hi ${name},</p>
          <p>I've received your message and will get back to you as soon as possible, typically within 24–48 hours.</p>
          <p>Here's a copy of what you sent:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          <p>Best regards,<br/><strong>Your Name</strong></p>
        </div>
      `,
    }).catch(err => console.error('Auto-reply failed:', err.message));

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.',
      data: { id: newMessage._id },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    const query = read !== undefined ? { read: read === 'true' } : {};

    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      unread: await Message.countDocuments({ read: false }),
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private
exports.markRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete message
// @route   DELETE /api/contact/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/contact/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const [totalMessages, unreadMessages, totalProjects, featuredProjects] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Project.countDocuments(),
      Project.countDocuments({ featured: true }),
    ]);

    res.json({
      success: true,
      data: { totalMessages, unreadMessages, totalProjects, featuredProjects },
    });
  } catch (err) {
    next(err);
  }
};
