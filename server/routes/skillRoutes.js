import express from 'express';
import { SkillAssessment } from '../models/SkillAssessment.js';
import { User } from '../models/User.js';

export const skillRouter = express.Router();

// GET /api/skills/assessments — List available skill verification tests (ID 112)
skillRouter.get('/assessments', async (req, res) => {
  try {
    let assessments = await SkillAssessment.find();
    if (assessments.length === 0) {
      // Seed standard tests
      assessments = await SkillAssessment.insertMany([
        {
          customId: 'assess-react',
          skill: 'React 19 & TypeScript',
          category: 'Frontend Engineering',
          questions: [
            {
              id: 'q1',
              question: 'Which hook should be preferred for synchronizing external DOM measurements?',
              options: ['useLayoutEffect', 'useEffect', 'useMemo', 'useRef'],
              correctIndex: 0
            },
            {
              id: 'q2',
              question: 'In React 19, how are server actions primarily declared?',
              options: ['With the "use server" directive', 'With useActionState only', 'Using redux thunks', 'Via getServerSideProps'],
              correctIndex: 0
            }
          ],
          passingScore: 80
        },
        {
          customId: 'assess-node',
          skill: 'Node.js & Security Architecture',
          category: 'Backend Architecture',
          questions: [
            {
              id: 'q1',
              question: 'What is the recommended minimum cost factor for bcrypt password hashing in 2026?',
              options: ['12', '4', '8', '10'],
              correctIndex: 0
            },
            {
              id: 'q2',
              question: 'How should refresh tokens be stored to protect against XSS token exfiltration?',
              options: ['HttpOnly, Secure, SameSite Cookie', 'localStorage', 'sessionStorage', 'URL Query Parameter'],
              correctIndex: 0
            }
          ],
          passingScore: 80
        }
      ]);
    }
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/skills/submit — Specialist submits test and receives verified badge (ID 112)
skillRouter.post('/submit', async (req, res) => {
  try {
    const { userId, assessmentId, answers = [] } = req.body;
    const user = await User.findOne({
      $or: [{ customId: userId }, { _id: userId }]
    });

    if (!user) return res.status(404).json({ error: 'Specialist account not found.' });

    const assessment = await SkillAssessment.findOne({
      $or: [{ customId: assessmentId }, { _id: assessmentId }]
    });

    if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });

    let correctCount = 0;
    assessment.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correctCount++;
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);
    const passed = score >= assessment.passingScore;

    if (passed) {
      if (!user.verifiedSkills) user.verifiedSkills = [];
      user.verifiedSkills = user.verifiedSkills.filter(s => s.skill !== assessment.skill);
      user.verifiedSkills.push({
        skill: assessment.skill,
        score,
        verifiedAt: new Date(),
        badge: 'Verified Gold Specialist'
      });
      await user.save();
    }

    res.json({
      success: true,
      passed,
      score,
      passingScore: assessment.passingScore,
      verifiedSkills: user.verifiedSkills
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
