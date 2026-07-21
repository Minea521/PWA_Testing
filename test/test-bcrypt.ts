// import * as bcrypt from 'bcrypt';

// async function testBcrypt() {
//   const plainPassword = 'mySecret123';

//   const hashed = await bcrypt.hash(plainPassword, 10);
//   console.log('Hashed password:', hashed);

//   const isMatch = await bcrypt.compare(plainPassword, hashed);
//   console.log('Password matches:', isMatch); // should print true

//   const isWrongMatch = await bcrypt.compare('wrongPassword', hashed);
//   console.log('Wrong password matches:', isWrongMatch); // should print false
// }

// testBcrypt();