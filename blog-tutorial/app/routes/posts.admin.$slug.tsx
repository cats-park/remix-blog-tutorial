import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { ValidatedForm } from "remix-validated-form";

import { getPost, updatePost } from '~/models/post.server';

import invariant from "tiny-invariant";

const inputClassName = 'w-full rounded border border-gray-500 px-2 py-1 text-lg';

export const loader = async ({ params }: LoaderArgs) => {

  const post = await getPost(params.slug);

  invariant(post, `Post not found: ${params.slug}`);


  return json({ post });
}

export const action = async ({ request }: ActionArgs) => {
  // TODO: remove me
  await new Promise(res => setTimeout(res, 1000));

  const formData = await request.formData();

  const title = formData.get('title');
  const slug = formData.get('slug');
  const markdown = formData.get('markdown');

  const errors = {
    title: title ? null : 'Title is required',
    slug: slug ? null : 'Slug is required',
    markdown: markdown ? null : 'Markdown is required',
  }

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json(errors);
  }

  invariant(
    typeof title === 'string',
    'title must be a string',
  )

  invariant(
    typeof slug === 'string',
    'slug must be a string',
  )

  invariant(
    typeof markdown === 'string',
    'markdown must be a string',
  )

  try {
    await updatePost({
      title,
      slug,
      markdown
    })
  }catch(error) {
    console.log(error);
  }

  return redirect(`/posts/admin/${slug}`);
}


export default function AdminSlug() {
  const { post } = useLoaderData<typeof loader>();

  const errors = useActionData<typeof action>();

  const navigation = useNavigation();
  const isUpdating = Boolean(
    navigation.state === 'submitting'
  );

  return (
    <Form
      method="post"
    >
      <p>
        <label>
          Post Title: {" "}
          {errors?.title ?
            (<em className="text-red-600">{errors.title}</em>) :
            null
          }
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={post.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {" "}
          {errors?.slug ?
            (<em className="text-red-600">{errors.slug}</em>) :
            null
          }
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={post.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:
          {errors?.markdown ?
            (<em className="text-red-600">{errors.markdown}</em>) :
            null
          }
        </label>
        <br />
        <textarea
          name="markdown"
          id="markdown"
          rows={20}
          className={`${inputClassName} font-mono`}
          defaultValue={post.markdown}
        />
      </p>
      <p className="text-right">
        {/* <button
          type="button"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          // disabled={XX}
        >
          {isUpdating ? 'Updating...' : 'Update Post'}
        </button> */}
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update Post'}
        </button>
      </p>
    </Form>
  )
}