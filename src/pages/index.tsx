import { SignIn, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

const CreatePostWizard = () => {
  const { user } = useUser();
  if(!user) return null;
  return (
    <div className="flex gap-3 w-full">
      <img src={user.profileImageUrl} alt="profile image" className="w-16 h-16 rounded-full"/>
      <input placeholder="type emojis" className="bg-transparent grow outline-none"/>
    </div>
  );
};

const Home: NextPage = () => {
  const user = useUser();
  const { data, isLoading } = api.posts.getAll.useQuery();
  if(isLoading) return (<div>Loading...</div>);
  if(!data) return (<div>Not signed in</div>);
  
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className=" h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-200 p-4">
            {user.isSignedIn ? (
              <div className="flex justify-center w-full">
                <SignOutButton />
                <CreatePostWizard/>
              </div>
            ) : (
              <SignInButton />
            )}

            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
          </div>

          <div className="flex flex-col">
            {[...data, ...data]?.map(({post, author}) => (
              <div key={post.id} className="p-8 border-b border-slate-400">{post.content}</div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
