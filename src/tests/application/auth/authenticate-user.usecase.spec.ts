import { AuthenticateUserUsecase } from '@application/auth/authenticate-user.usecase';
import { InvalidCredentialsError } from '@domain/user/errors/invalid-credentials.error';
import { NoActiveCenterError } from '@domain/user/errors/no-active-center.error';
import { User } from '@domain/user/user.entity';
import { FakePasswordHasher } from './fake-password-hasher';
import { InMemoryUserRepository } from './in-memory-user.repository';

describe('AuthenticateUserUsecase', () => {
	const hasher = new FakePasswordHasher();

	it("échoue si l'utilisateur n'existe pas", async () => {
		const repo = new InMemoryUserRepository([]);
		const usecase = new AuthenticateUserUsecase(repo, hasher);

		await expect(
			usecase.execute({ username: 'john', password: '123' }),
		).rejects.toBeInstanceOf(InvalidCredentialsError);
	});

	it('échoue si le mot de passe est invalide', async () => {
		const user = User.hydrate({
			id: '1',
			username: 'john',
			passwordHash: 'hash',
			role: 'BENEVOLE',
			centerId: 'center-1',
		});
		const repo = new InMemoryUserRepository([user]);
		const usecase = new AuthenticateUserUsecase(repo, hasher);

		await expect(
			usecase.execute({ username: 'john', password: 'wrong' }),
		).rejects.toBeInstanceOf(InvalidCredentialsError);
	});

	it('échoue si utilisateur non admin sans centre actif', async () => {
		const user = User.hydrate({
			id: '1',
			username: 'john',
			passwordHash: 'hash',
			role: 'BENEVOLE',
			centerId: null,
		});
		const repo = new InMemoryUserRepository([user]);
		const usecase = new AuthenticateUserUsecase(repo, hasher);

		await expect(
			usecase.execute({ username: 'john', password: 'hash' }),
		).rejects.toBeInstanceOf(NoActiveCenterError);
	});

	it("retourne l'utilisateur si authentification valide", async () => {
		const user = User.hydrate({
			id: '1',
			username: 'john',
			passwordHash: 'hash',
			role: 'BENEVOLE',
			centerId: 'center-1',
		});
		const repo = new InMemoryUserRepository([user]);
		const usecase = new AuthenticateUserUsecase(repo, hasher);

		const result = await usecase.execute({
			username: 'john',
			password: 'hash',
		});

		expect(result).toBe(user);
	});
});
