const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { authenticate } = require('../middleware/auth');

// GET /api/messages/conversations — list user's conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'personalInfo.firstName personalInfo.lastName personalInfo.email')
      .populate('propertyId', 'title location')
      .sort({ 'lastMessage.at': -1 });

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages/conversations/start — start a new conversation
router.post('/conversations/start', authenticate, async (req, res) => {
  try {
    const { receiverId, landParcelId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'receiverId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ success: false, message: 'Invalid receiverId' });
    }

    if (landParcelId && !mongoose.Types.ObjectId.isValid(landParcelId)) {
      return res.status(400).json({ success: false, message: 'Invalid landParcelId' });
    }

    // Check if a conversation already exists between these two users for this property
    const query = {
      participants: { $all: [new mongoose.Types.ObjectId(receiverId), req.user.id] }
    };
    if (landParcelId) {
      query.propertyId = new mongoose.Types.ObjectId(landParcelId);
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      const conversationData = {
        participants: [req.user.id, receiverId]
      };
      if (landParcelId) {
        conversationData.propertyId = landParcelId;
      }
      conversation = await Conversation.create(conversationData);
    }

    await conversation.populate('participants', 'personalInfo.firstName personalInfo.lastName personalInfo.email');

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/messages/conversations/:conversationId — get messages in a conversation
router.get('/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: 'Invalid conversationId' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: messages.slice().reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages/conversations/:conversationId — send a message
router.post('/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { body, attachments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: 'Invalid conversationId' });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Message body is required' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      body: body.trim(),
      attachments: attachments || [],
      readBy: [req.user.id]
    });

    // Update conversation's lastMessage
    conversation.lastMessage = {
      text: body.trim(),
      at: new Date(),
      by: req.user.id
    };
    await conversation.save();

    await message.populate('senderId', 'personalInfo.firstName personalInfo.lastName');

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/messages/:messageId/read — mark message as read
router.patch('/:messageId/read', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, message: 'Invalid messageId' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Verify the user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages/:messageId/report — flag/report a message
router.post('/:messageId/report', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, message: 'Invalid messageId' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Verify the user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    message.flagged = true;
    await message.save();

    res.json({ success: true, message: 'Message reported successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
