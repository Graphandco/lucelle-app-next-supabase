"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Span } from "next/dist/trace";
import { House, LayoutDashboard, ListTodo, Store } from "lucide-react";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description: "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export default function MenuButton({ user }: { user: { user_metadata?: { display_name?: string } } | boolean }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            {typeof user === "object" && user.user_metadata?.display_name
              ? `${user.user_metadata.display_name}`
              : "S'identifier"}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid whitespace-nowrap p-3">
              {/* <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/dashboard">
                    <div className="mb-2 mt-4 text-lg font-medium">
                      {typeof user === "object" && user.user_metadata?.display_name
                        ? `${user.user_metadata.display_name}`
                        : "S'identifier"}
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components built with Radix UI and Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li> */}
              <div className="text-primary font-semibold mb-0.5">
                {typeof user === "object" && user.user_metadata?.display_name
                  ? `${user.user_metadata.display_name}`
                  : "S'identifier"}
              </div>
              <ListItem href="/">
                <span className="flex items-center gap-2">
                  <House size={18} />
                  <span className="text-white">Accueil</span>
                </span>
              </ListItem>
              <ListItem href="/dashboard">
                <span className="flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  <span className="text-white">Tableau de bord</span>
                </span>
              </ListItem>
              <div className="text-primary font-semibold mt-2 mb-0.5">Produits</div>
              <ListItem href="/shopping-list" title="Produits">
                <span className="flex items-center gap-2">
                  <ListTodo size={18} />
                  <span className="text-white">Liste de courses</span>
                </span>
              </ListItem>
              <ListItem href="/inventaire">
                <span className="flex items-center gap-2">
                  <Store size={18} />
                  <span className="text-white">Inventaire</span>
                </span>
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none rounded-md p-1 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}>
            {/* <div className="font-medium">{title}</div> */}
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  },
);
ListItem.displayName = "ListItem";
