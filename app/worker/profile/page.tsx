import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from './profile-form';

export default async function WorkerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          name: true,
          phone: true,
          walletAddress: true,
          aadhaarVerified: true,
          aadhaarLast4: true,
          eShramUAN: true,
        },
      },
    },
  });

  if (!profile) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">Profile</h1>
        <p className="mt-2 text-text-secondary">Worker profile not found.</p>
      </div>
    );
  }

  return (
    <ProfileForm
      profileId={profile.id}
      initial={{
        name: profile.user.name,
        phone: profile.user.phone,
        walletAddress: profile.user.walletAddress,
        trade: profile.trade,
        city: profile.city,
        state: profile.state,
        bio: profile.bio ?? '',
        photoUrl: profile.photoUrl ?? '',
        aadhaarVerified: profile.user.aadhaarVerified,
        aadhaarLast4: profile.user.aadhaarLast4,
        eShramUAN: profile.user.eShramUAN,
      }}
    />
  );
}
