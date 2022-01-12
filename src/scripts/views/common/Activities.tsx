import { get } from "lodash";

import { Activity } from "../../protocols/activitypub";

interface ActivityDisplayProps {
  activity: Activity;
}

function ActivityDisplay({ activity }: ActivityDisplayProps) {
  const note = get(activity, [
    "https://www.w3.org/ns/activitystreams#object",
    0,
    "https://www.w3.org/ns/activitystreams#content",
    0,
    "@value",
  ]);
  return <div>{note}</div>;
}

export interface ActivitiesProps {
  activities: Object[];
}

export function Activities({ activities }: ActivitiesProps) {
  return (
    <section>
      <div className="container mw-md">
        <h3>Activities</h3>
        <div className="list-group">
          {activities.map((a, i) => (
            <ActivityDisplay
              // @ts-ignore
              key={i}
              activity={a}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
