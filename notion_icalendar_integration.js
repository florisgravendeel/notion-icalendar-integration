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
        addAppointment(event.summary, event.start.toISOString(), event.end.toISOString(), "testtest")
    }
}


async function addAppointment(title, date_start, date_end, description) {
    try {
        const response = await notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            icon: {
                "type": "emoji",
                "emoji": "🥬"
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
                Description: {
                    "rich_text": [
                        {
                            "text": {
                                "content": description
                            }
                        }
                    ]
                },
            },
            children: [
                {
                    "object": "block",
                    "heading_2": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "Lacinato kale"
                                }
                            }
                        ]
                    }
                },
                {
                    "object": "block",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
                                    "link": {
                                        "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
                                    }
                                },
                                "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
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

