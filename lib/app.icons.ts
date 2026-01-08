import { ExternalProvider } from "@/types/enum";
import {
    SiDiscord,
    SiFigma,
    SiGithub,
    SiJira,
    SiNotion,
    SiSlack,
} from "react-icons/si";

export const appIconMap: Record<
    ExternalProvider,
    React.ComponentType<{ className?: string }>
> = {
    [ExternalProvider.GITHUB]: SiGithub,
    [ExternalProvider.SLACK]: SiSlack,
    [ExternalProvider.DISCORD]: SiDiscord,
    [ExternalProvider.FIGMA]: SiFigma,
    [ExternalProvider.JIRA]: SiJira,
    [ExternalProvider.NOTION]: SiNotion,
};