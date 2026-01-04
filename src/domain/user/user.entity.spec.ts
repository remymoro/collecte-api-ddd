// import { NoActiveCenterError } from "./errors/no-active-center.error";
// import { User } from "./user.entity";

// describe('User domain', () => {
//   it('allows admin without center', () => {
//     const admin = new User(
//       '1',
//       'admin',
//       'hash',
//       'ADMIN',
//       null,
//     );

//     expect(() => admin.ensureCanLogin()).not.toThrow();
//   });

//   it('refuses benevole without center', () => {
//     const benevole = new User(
//       '2',
//       'benevole-aiguillon',
//       'hash',
//       'BENEVOLE',
//       null,
//     );

//     expect(() => benevole.ensureCanLogin())
//       .toThrow(NoActiveCenterError);
//   });

//   it('allows benevole with center', () => {
//     const benevole = new User(
//       '3',
//       'benevole-aiguillon',
//       'hash',
//       'BENEVOLE',
//       'center-1',
//     );

//     expect(() => benevole.ensureCanLogin()).not.toThrow();
//   });
// });
