import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

export const Navigation = () => {
  return (
    <nav className="border-b">
      <div className="flex container h-16 items-center justify-between px-4 mx-auto">
        <div className="text-xl font-semibold">RAG Chatbot</div>

        <div className="flex gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <SignOutButton>
              <Button variant="outline">Sign Out</Button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
