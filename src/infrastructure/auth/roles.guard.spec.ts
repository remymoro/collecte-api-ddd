// Tests commentés - à implémenter plus tard
describe('RolesGuard', () => {
  it.skip('should be tested', () => {
    // TODO: Implémenter les tests du RolesGuard
  });
});

// import { AuthenticatedUser } from '@application/auth/authenticated-user.output';
// import { ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RolesGuard } from './guards/roles.guard';


// describe('RolesGuard', () => {
//   let guard: RolesGuard;
//   let reflector: Reflector;

//   beforeEach(() => {
//     reflector = new Reflector();
//     guard = new RolesGuard(reflector);
//   });

//   const mockContext = (user?: AuthenticatedUser): ExecutionContext =>
//     ({
//       switchToHttp: () => ({
//         getRequest: () => ({ user }),
//       }),
//       getHandler: jest.fn(),
//       getClass: jest.fn(),
//     }) as unknown as ExecutionContext;

//   it('should allow access when no roles are required', () => {
//     jest
//       .spyOn(reflector, 'getAllAndOverride')
//       .mockReturnValue(undefined);

//     expect(guard.canActivate(mockContext())).toBe(true);
//   });

//   it('should allow ADMIN when role ADMIN is required', () => {
//     jest
//       .spyOn(reflector, 'getAllAndOverride')
//       .mockReturnValue(['ADMIN']);

//     const user: AuthenticatedUser = {
//       id: '1',
//       role: 'ADMIN',
//       activeCenterId: 'center-1',
//     };

//     expect(guard.canActivate(mockContext(user))).toBe(true);
//   });

//   it('should deny BENEVOLE when role ADMIN is required', () => {
//     jest
//       .spyOn(reflector, 'getAllAndOverride')
//       .mockReturnValue(['ADMIN']);

//     const user: AuthenticatedUser = {
//       id: '2',
//       role: 'BENEVOLE',
//       activeCenterId: 'center-1',
//     };

//     expect(() => guard.canActivate(mockContext(user))).toThrow(
//       ForbiddenException,
//     );
//   });

//   it('should deny access if user is missing', () => {
//     jest
//       .spyOn(reflector, 'getAllAndOverride')
//       .mockReturnValue(['ADMIN']);

//     expect(() => guard.canActivate(mockContext())).toThrow(
//       ForbiddenException,
//     );
//   });
// });
