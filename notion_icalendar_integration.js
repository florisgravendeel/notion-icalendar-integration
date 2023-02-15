import { Client } from "@notionhq/client"
import ical from "node-ical";

if (process.argv.length !== 5){

    console.log("Usage:\nnode notion_calendar_addon.js [NOTION_KEY] [NOTION_DATABASE_ID] [FILE.ICS] " +
        "\n\nPlease read: https://developers.notion.com/docs/create-a-notion-integration for more information " +
            "about the NOTION_DATABASE_ID and NOTION_KEY.");
    process.exit(1);
}
let NOTION_KEY = process.argv[2];
let NOTION_DATABASE_ID = process.argv[3];

const notion = new Client({ auth: NOTION_KEY })
const databaseId = NOTION_DATABASE_ID

let fileName = process.argv[4];
// Use the sync function parseFile() to parse calendar.ics file
const events = ical.sync.parseFile(fileName);

// Loop through appointments and add them to Notion
for (const event of Object.values(events)) {
    if (event.start !== undefined && event.end !== undefined && event.summary !== undefined) {
        let description = event.description !== undefined ? event.description : "";
        addAppointment(event.summary, event.start.toISOString(), event.end.toISOString(), description)
    }
}


async function addAppointment(title, date_start, date_end, description) {
    try {
        const response = await notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            properties: {
                Name: {
                    type: 'title',
                    title: [
                        {
                            type: 'text',
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
                Date: {
                    "date": {
                        "start": date_start,
                        "end": date_end
                    }
                },
            },
            children: [
                {
                    "object": "block",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": description,
                                },
                            }
                        ],
                        "color": "default"
                    }
                }
            ]
        });
        console.log(response)
        console.log("Success! Entry added.")
    } catch (error) {
        console.error(error.body)
        process.exit(1);
    }
}

