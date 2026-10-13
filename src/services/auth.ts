import { UserProfile } from '../types';
import { mockUsers } from '../data/mockData';

const CURRENT_USER_ID_KEY = 'mefe_current_user_id';
const ALL_USERS_KEY = 'mefe_all_users';

class AuthService {
  getAllUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(ALL_USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(mockUsers));
    return mockUsers;
  }

  saveAllUsers(users: UserProfile[]): void {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }

  getCurrentUser(): UserProfile | null {
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    const users = this.getAllUsers();
    if (currentId) {
      const found = users.find(u => u.uid === currentId);
      if (found) return found;
    }
    // Default to first user if none set
    if (users.length > 0) {
      localStorage.setItem(CURRENT_USER_ID_KEY, users[0].uid);
      return users[0];
    }
    return null;
  }

  switchUser(userId: string): UserProfile | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.uid === userId);
    if (user) {
      localStorage.setItem(CURRENT_USER_ID_KEY, user.uid);
      return user;
    }
    return null;
  }

  loginWithEmail(email: string): UserProfile {
    const users = this.getAllUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      // Auto-register clean new user if not exists
      const namePart = email.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      user = {
        uid: 'usr_' + Date.now(),
        email: email.trim(),
        displayName,
        photoURL: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        bio: 'Mindful fashion enthusiast',
        role: 'user',
        isPremium: true,
        preferredLanguage: 'en',
        status: { state: 'active', until: null, reason: '' },
        avatarConfig: {
          baseModelId: 'mannequin_classic',
          skinTone: '#E4B698',
          hairStyle: 'sleek_bob',
          hairColor: '#3C2F2F',
          canvasScale: 1,
          bodyType: 'classic'
        },
        followersCount: 1,
        followingCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(user);
      this.saveAllUsers(users);
    }
    localStorage.setItem(CURRENT_USER_ID_KEY, user.uid);
    return user;
  }

  register(displayName: string, email: string): UserProfile {
    const users = this.getAllUsers();
    const newUser: UserProfile = {
      uid: 'usr_' + Date.now(),
      email: email.trim(),
      displayName: displayName.trim(),
      photoURL: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      bio: 'Fashion & wellness curator',
      role: 'user',
      isPremium: true,
      preferredLanguage: 'en',
      status: { state: 'active', until: null, reason: '' },
      avatarConfig: {
        baseModelId: 'mannequin_classic',
        skinTone: '#E4B698',
        hairStyle: 'sleek_bob',
        hairColor: '#3C2F2F',
        canvasScale: 1,
        bodyType: 'classic'
      },
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveAllUsers(users);
    localStorage.setItem(CURRENT_USER_ID_KEY, newUser.uid);
    return newUser;
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  }

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.uid === current.uid);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveAllUsers(users);
    return users[index];
  }
}

export const authService = new AuthService();
