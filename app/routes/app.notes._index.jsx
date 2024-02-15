import { json, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
    Button,
    IndexTable,
    Page,
} from "@shopify/polaris";
import prisma from "../db.server";
import { useEffect } from "react";
import style from "./../styles/style.css";

export const links = () => [
    { rel: "stylesheet", href: style },
  ];
export const meta = () => {
    return [{ title: "Notes" }];
};

export const loader = async () => {
    const notes = await prisma.notes.findMany({
        select: {
            title: true,
            id: true,
            description: true,
            createdAt: true
        },
        orderBy: {
            id: 'desc',
        },
    });
    return json({
        notes
    });
};
export const action = async ({ request }) => {
    const { id } = {
        ...Object.fromEntries(await request.formData()),
    };
    await prisma.notes.delete({
        where: {
            id: parseInt(id),
        },
    });
    return json({ isDelete: true });
}
export default function Notes() {
    const {
        notes
    } = useLoaderData();
    const actionData = useActionData();
    const resourceName = {
        singular: 'note',
        plural: 'notes',
    };
    useEffect(() => {
        if (actionData?.isDelete) {
            shopify.toast.show("Deleted note successfully");
        }
    }, [actionData]);
    const submit = useSubmit();
    const deleteRow = (id) => {
        submit(
            {
                id
            },
            { replace: false, method: "POST" }
        );
    }
    const rowMarkup = notes.map(
        (
            { id, description, createdAt, title },
            index,
        ) => (
            <IndexTable.Row key={index} >
                <IndexTable.Cell>#{index+1}</IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell >{description}</IndexTable.Cell>
                <IndexTable.Cell>{createdAt}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Button variant="plain" onClick={() => nagivate(`/app/notes/${id}`)}>Edit</Button> /
                    <Button variant="plain" onClick={() => deleteRow(id)} > Delete</Button>  </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );
    const nagivate = useNavigate();
    return (
        <Page fullWidth title="Notes"
            primaryAction={{ content: 'Add Note', onAction: () => nagivate('/app/notes/add') }}
        >
            <IndexTable

                resourceName={resourceName}
                itemCount={notes.length}
                headings={[
                    { title: 'Id' },
                    { title: 'Title' },
                    { title: 'Description' },
                    { title: 'Created' },
                    { title: 'Action' },
                ]}
                selectable={false}
            >
                {rowMarkup}
            </IndexTable>
        </Page>
    );
}
