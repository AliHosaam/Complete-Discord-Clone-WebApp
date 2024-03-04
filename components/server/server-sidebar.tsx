import currentProfile from "@/lib/current-profile";
import { redirect } from "next/navigation";
import React from "react";
import prisma from "@/lib/prismadb";
import { ChannelType, MemberRole } from "@prisma/client";
import ServerHeader from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import ServerSearch from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import ServerSection from "./server-section";
import ServerChannel from "./server-channel";
import ServerMember from "./server-member";

interface ServerSidebarProps {
  serverId: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};

const ServerSidebar: React.FC<ServerSidebarProps> = async ({ serverId }) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  const textChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );

  const audioChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );

  const videoChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  const members = server?.members.filter(
    (member) => member.profileId !== profile.id
  );

  if (!server) {
    return redirect("/");
  }

  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  return (
    <div className="flex flex-col h-screen text-primary w-full dark:bg-[#2b2d31] bg-[#f2f3f5]">
      <ServerHeader server={server} role={role} />

      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  name: member.profile.name,
                  id: member.id,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-300 dark:bg-zinc-700 rounded my-2" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channel"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
              server={server}
            />

            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  server={server}
                  channel={channel}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}

        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channel"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Audio Channels"
              server={server}
            />

            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  server={server}
                  channel={channel}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}

        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channel"
              channelType={ChannelType.VIDEO}
              role={role}
              label="Video Channels"
              server={server}
            />

            <div className="space-y-[2px]">
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  server={server}
                  channel={channel}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}

        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="member"
              role={role}
              label="Members"
              server={server}
            />

            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember server={server} member={member} key={member.id} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;