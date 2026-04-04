const Message = require('../models/message');
const mongoose = require('mongoose');
const path = require('path');

// In-memory fallback store when MongoDB is unavailable
const fallbackStore = [];

function dbIsConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

exports.getConversation = async (req, res) => {
  const current = req.userId;
  const other = req.params.userId;
  try {
    if (!dbIsConnected()) {
      const messages = fallbackStore.filter(m => (m.from === current && m.to === other) || (m.from === other && m.to === current)).sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt));
      return res.json(messages);
    }
    const messages = await Message.find({
      $or: [
        { from: current, to: other },
        { from: other, to: current }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.postMessage = async (req, res) => {
  const from = req.userId;
  const to = req.body.to;
  if (!to) return res.status(400).json({ error: 'Missing "to" field' });

  try {
    let messageContent = null;
    if (req.file) {
      const filePath = path.join('/uploads', req.file.filename).replace(/\\/g, '/');
      messageContent = { type: 'file', text: filePath };
    } else if (req.body.text) {
      messageContent = { type: 'text', text: req.body.text };
    } else {
      return res.status(400).json({ error: 'Missing message content (file or text)' });
    }

    if (!dbIsConnected()) {
      const msg = { _id: fallbackStore.length + 1, from, to, messageContent, createdAt: new Date().toISOString() };
      fallbackStore.push(msg);
      return res.status(201).json(msg);
    }

    const msg = new Message({ from, to, messageContent });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestPerUser = async (req, res) => {
  const userId = req.userId;
  try {
    if (!dbIsConnected()) {
      // compute latest per other user from fallbackStore
      const relevant = fallbackStore.filter(m => m.from === userId || m.to === userId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
      const map = new Map();
      for (const m of relevant) {
        const other = m.from === userId ? m.to : m.from;
        if (!map.has(other)) map.set(other, m);
      }
      const result = Array.from(map.entries()).map(([user, msg]) => ({ user, ...msg }));
      return res.json(result);
    }

    const pipeline = [
      {
        $match: {
          $or: [ { from: userId }, { to: userId } ]
        }
      },
      {
        $addFields: {
          other: {
            $cond: [ { $eq: ['$from', userId] }, '$to', '$from' ]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$other',
          messageId: { $first: '$_id' },
          from: { $first: '$from' },
          to: { $first: '$to' },
          messageContent: { $first: '$messageContent' },
          createdAt: { $first: '$createdAt' }
        }
      },
      { $project: { _id: 0, user: '$_id', messageId: 1, from:1, to:1, messageContent:1, createdAt:1 } },
      { $sort: { createdAt: -1 } }
    ];

    const results = await Message.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
