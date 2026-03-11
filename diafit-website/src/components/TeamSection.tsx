"use client";

import ProfileCard from "./ProfileCard";

const TEAM = [
  {
    name: "Jiro L. Del Carmon",
    title: "UI/UX Developer",
    handle: "jirodelcarmon",
    avatarUrl: "/team/Delcarmen.jpg",
    miniAvatarUrl: "/team/Delcarmen.jpg",
  },
  {
    name: "John Bryan V. Cancel",
    title: "Project Manager",
    handle: "johnbryancancel",
    avatarUrl: "/team/Cancel.jpg",
    miniAvatarUrl: "/team/Cancel.jpg",
  },
  {
    name: "John Brieyloo E. Umipon",
    title: "UI & Documentation",
    handle: "johnbrieyloo",
    avatarUrl: "/team/Umipon.jpg",
    miniAvatarUrl: "/team/Umipon.jpg",
  },
];

export function TeamSection() {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 sm:gap-12 lg:gap-16">
      {TEAM.map((member) => (
        <ProfileCard
          key={member.handle}
          name={member.name}
          title={member.title}
          handle={member.handle}
          status="Online"
          avatarUrl={member.avatarUrl}
          miniAvatarUrl={member.miniAvatarUrl}
          contactText="Contact Me"
          showUserInfo={false}
          enableTilt={true}
          enableMobileTilt={false}
          behindGlowEnabled={true}
          behindGlowColor="rgba(125, 190, 255, 0.67)"
          innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
          className="w-full max-w-[320px] mx-auto"
        />
      ))}
    </div>
  );
}
