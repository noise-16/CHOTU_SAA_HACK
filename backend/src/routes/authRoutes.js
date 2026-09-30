const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'PATIENT', room, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        room: role === 'DOCTOR' ? room : null,
        phone
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        room: true,
        phone: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, room: user.room },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

/**
 * Login (Supports email + password OR Ticket Number for patients)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, ticketNumber, identifier } = req.body;

    const loginId = (identifier || email || ticketNumber || '').trim();

    // 1. Patient Ticket Login (e.g., CW-101)
    if (loginId.toUpperCase().startsWith('CW-') || ticketNumber) {
      const targetTicket = (ticketNumber || loginId).toUpperCase();
      const patient = await prisma.patient.findUnique({
        where: { ticketNumber: targetTicket }
      });

      if (!patient) {
        return res.status(404).json({ error: `No active patient ticket found for ${targetTicket}.` });
      }

      const token = jwt.sign(
        { id: patient.id, role: 'PATIENT', ticketNumber: patient.ticketNumber, name: patient.name },
        JWT_SECRET,
        { expiresIn: '3d' }
      );

      return res.json({
        user: {
          id: patient.id,
          name: patient.name,
          role: 'PATIENT',
          ticketNumber: patient.ticketNumber,
          phone: patient.phone
        },
        token
      });
    }

    // 2. Standard Staff / Patient Email Login
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/Identifier and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: loginId.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, room: user.room },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        room: user.room,
        phone: user.phone
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to process login.' });
  }
});

/**
 * Get current profile
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'PATIENT' && req.user.ticketNumber) {
      const patient = await prisma.patient.findUnique({
        where: { ticketNumber: req.user.ticketNumber },
        include: {
          assignedDoctor: { select: { name: true, room: true } },
          consultationSummary: true
        }
      });
      return res.json(patient);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        room: true,
        phone: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
