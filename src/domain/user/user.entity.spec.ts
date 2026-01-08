import { NoActiveCenterError } from '@domain/user/errors/no-active-center.error';
import { User } from '@domain/user/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserId } from './value-objects/user-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';

describe('User Entity', () => {
  // ============================
  // CRÉATION
  // ============================

  describe('createForCenter', () => {
    it('should create a BENEVOLE user attached to a center', () => {
      // POURQUOI : Les bénévoles doivent être rattachés à un centre pour les collectes
      // RÈGLE MÉTIER : Nouveau utilisateur centre = rôle BENEVOLE obligatoire
      const centerId = CenterId.generate();
      const user = User.createForCenter({
        username: 'benevole@example.com',
        passwordHash: 'hashed-password',
        centerId,
      });

      expect(user.username).toBe('benevole@example.com');
      expect(user.role).toBe(UserRole.BENEVOLE);
      expect(user.centerId).not.toBeNull();
      expect(user.centerId?.equals(centerId)).toBe(true);
    });
  });

  // ============================
  // RÈGLES MÉTIER — CONNEXION
  // ============================

  describe('ensureCanLogin', () => {
    it('should allow ADMIN to login without center', () => {
      // POURQUOI : Les administrateurs peuvent se connecter sans centre (gestion globale)
      // RÈGLE MÉTIER : ADMIN n'a pas besoin de centerId pour se connecter
      const userId = UserId.generate();
      const admin = User.hydrate({
        id: userId,
        username: 'admin',
        passwordHash: 'hash',
        role: UserRole.ADMIN,
        centerId: null,
      });

      expect(() => admin.ensureCanLogin()).not.toThrow();
    });

    it('should prevent BENEVOLE without center from logging in', () => {
      // POURQUOI : Un bénévole sans centre ne peut pas effectuer de collectes
      // RÈGLE MÉTIER : BENEVOLE nécessite un centerId actif pour se connecter
      const userId = UserId.generate();
      const benevole = User.hydrate({
        id: userId,
        username: 'benevole-aiguillon',
        passwordHash: 'hash',
        role: UserRole.BENEVOLE,
        centerId: null,
      });

      expect(() => benevole.ensureCanLogin()).toThrow(NoActiveCenterError);
    });

    it('should allow BENEVOLE with center to login', () => {
      // POURQUOI : Un bénévole avec centre actif peut effectuer des collectes
      const userId = UserId.generate();
      const centerId = CenterId.generate();
      const benevole = User.hydrate({
        id: userId,
        username: 'benevole-aiguillon',
        passwordHash: 'hash',
        role: UserRole.BENEVOLE,
        centerId,
      });

      expect(() => benevole.ensureCanLogin()).not.toThrow();
    });

    it('should prevent RESPONSABLE without center from logging in', () => {
      // POURQUOI : Un responsable sans centre ne peut pas gérer d'opérations
      // RÈGLE MÉTIER : RESPONSABLE nécessite un centerId actif (comme BENEVOLE)
      const userId = UserId.generate();
      const responsable = User.hydrate({
        id: userId,
        username: 'responsable@example.com',
        passwordHash: 'hash',
        role: UserRole.BENEVOLE,
        centerId: null,
      });

      expect(() => responsable.ensureCanLogin()).toThrow(NoActiveCenterError);
    });
  });
});
