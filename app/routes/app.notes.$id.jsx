import { json, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
    Button,
    FormLayout,
    Page,
    TextField,
} from "@shopify/polaris";
import prisma from "../db.server";
import { Fragment, useEffect, useState } from "react";
export const loader = async ({ request, params }) => {
    let noteInfo = {}
    if (parseInt(params.id)) {
        noteInfo = await prisma.notes.findFirst({
            select: {
                title: true,
                id: true,
                description: true,
            },
            where: {
                id: parseInt(params.id)
            }
        });
    }
    return json({
        noteInfo
    });
};

export const action = async ({ request }) => {
    const { title, description, id } = {
        ...Object.fromEntries(await request.formData()),
    };
    if (parseInt(id)) {
        await prisma.notes.update({
            where: {
                id: parseInt(id)
            },
            data: { title, description }
        });
        return json({ updatedNote: true });
    } else {

        const note = await prisma.notes.create({
            data: {
                title,
                description
            },
            select: {
                id: true,
            }
        });
        return json({ noteId: note?.id });
    }

}

export default function Notes() {
    const {
        noteInfo
    } = useLoaderData();
    const actionData = useActionData();
    const [isSubmit, setSubmit] = useState(false);
    const [note, setNote] = useState({
        title: "",
        description: "",
        id: 0,
    });
    const nagivate = useNavigate();
    useEffect(() => {
        if (Object.keys(noteInfo).length) {
            setNote(noteInfo)
        }
    }, [noteInfo]);
    useEffect(() => {
        if (actionData && Object.keys(actionData)?.length) {
            shopify.toast.show(actionData.updatedNote ? "Note updated" : "Note created");
            nagivate('/app/notes');
        }
    }, [actionData]);

    const onChange = (name, value) => {
        setNote({ ...note, [name]: value });
    }
    const submit = useSubmit();
    const onSubmit = () => {
        const { title, description, id } = note;
        setSubmit(true);
        if (!title?.length || !description?.length) {
            return;
        }
        submit(
            {
                title,
                description,
                id
            },
            { replace: false, method: "POST" }
        );
    }
    return (
        <Page fullWidth title={!note?.id ? 'Add Note' : 'Update Note'}
            backAction={{ url: '/app/notes' }}
        >
            <div style={{ width: '50%' }}>
                <FormLayout  >
                    <TextField label="Title"
                        onChange={(value) => onChange('title', value)}
                        autoComplete="off"
                        value={note?.title}
                        error={
                            isSubmit && !note?.title?.trim()?.length
                            && <Fragment>Title is required</Fragment>
                        }
                    />
                    <TextField
                        label="Description"
                        value={note?.description}
                        onChange={(value) => onChange('description', value)}
                        multiline={4}
                        autoComplete="off"
                        error={
                            isSubmit &&
                            !note?.description?.trim()?.length
                            && <Fragment>Description is required</Fragment>
                        }
                    />
                    <Button onClick={() => onSubmit()}>Submit</Button>
                </FormLayout>
            </div>

        </Page>
    );
}
