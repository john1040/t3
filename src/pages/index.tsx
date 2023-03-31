import { SignIn, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api, RouterOutputs } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("failed to post, please try again!");
      }
    },
  });
  if (!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="type emojis"
        className="grow bg-transparent outline-none"
        type={"text"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if(input !== "") mutate({ content: input });
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button
          onClick={() => {
            mutate({ content: input });
          }}
          disabled={isPosting}
        >
          {" "}
          submit
        </button>
      )}
      {isPosting && (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt="profile image"
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex">
          <Link href={`/@${author.username}`}>
          <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
          <span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
          </Link>
          
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>something went wrong</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();
  // return empty div if both arent loaded
  if (!userLoaded) return <div />;
  // if (isLoading) return <LoadingPage/>;
  // if (!data) return <div>Not signed in</div>;

  return (
    <>
      
      <main className="flex h-screen justify-center">
        <div className=" h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-200 p-4">
            {isSignedIn ? (
              <div className="flex w-full justify-center">
                <SignOutButton />
                <CreatePostWizard />
              </div>
            ) : (
              <SignInButton />
            )}

            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
