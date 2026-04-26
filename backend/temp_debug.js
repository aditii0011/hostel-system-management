const connectDB = require('./config/db');
const User = require('./models/user');

(async () => {
  await connectDB();
  const students = await User.find({ role: 'student' }).limit(20).lean();
  console.log('students', students.map(u => ({ name: u.name, studentId: u.studentId, studentPhone: u.studentPhone, parentName: u.parentName, parentPhone: u.parentPhone, hostelName: u.hostelName, wardName: u.wardName, phone: u.phone })));
  const parents = await User.find({ role: 'parent' }).limit(20).lean();
  console.log('parents', parents.map(u => ({ name: u.name, wardName: u.wardName, wardId: u.wardId, phone: u.phone }))); 
  process.exit(0);
})();