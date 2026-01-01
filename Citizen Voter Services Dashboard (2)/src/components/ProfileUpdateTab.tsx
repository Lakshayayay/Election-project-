import { ProfileServices } from './ProfileServices';
import { ApplicationStatus } from './ApplicationStatus';

export function ProfileUpdateTab() {
  return (
    <div>
      <ProfileServices />
      <ApplicationStatus />
    </div>
  );
}
