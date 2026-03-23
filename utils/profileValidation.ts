import { User } from '../types';

/**
 * Single source of truth for profile completeness validation.
 * Used by ProtectedRoute, Auth, Onboarding, and any other component
 * that needs to check if a user's profile is fully set up.
 * 
 * A profile is complete when:
 * 1. The user has a valid is_incomplete flag set to false
 * 2. Required fields (handle, school) have valid non-default values
 * 3. Full name is not the default 'Student' placeholder
 */
export const isProfileComplete = (user: User | null): boolean => {
    if (!user) return false;

    // Check the explicit incompleteness flag first - this is the primary check
    if (user.is_incomplete === true) return false;

    // Validate required fields have real values (not defaults)
    const hasValidHandle = !!user.handle && user.handle.length >= 3;
    const hasValidSchool = !!user.school && user.school !== 'Not Specified' && user.school.trim().length > 0;
    const hasValidFullName = !!user.full_name && user.full_name !== 'Student' && user.full_name.trim().length >= 2;

    return hasValidHandle && hasValidSchool && hasValidFullName;
};

/**
 * Check if user only needs to complete onboarding (has account but missing profile data)
 * This is true for Google sign-in users who haven't set their handle/school yet
 */
export const needsOnboarding = (user: User | null): boolean => {
    if (!user) return false;
    return !isProfileComplete(user);
};
