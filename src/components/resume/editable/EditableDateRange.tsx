"use client";

import { formatDates } from "../templates/shared";
import { EditableText } from "./EditableText";
import { useEditable } from "./EditContext";

export function EditableDateRange({
  pathPrefix,
  start,
  end,
  current,
  style,
  className,
}: {
  pathPrefix: string;
  start?: string;
  end?: string;
  current?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const editable = useEditable();
  if (!editable) {
    return (
      <span style={style} className={className}>
        {formatDates(start, end, current)}
      </span>
    );
  }

  return (
    <span style={style} className={className}>
      <EditableText field={`${pathPrefix}.start_date`} value={start} style={style} />
      <span> – </span>
      {current ? (
        <span>Present</span>
      ) : (
        <EditableText field={`${pathPrefix}.end_date`} value={end} style={style} />
      )}
    </span>
  );
}
