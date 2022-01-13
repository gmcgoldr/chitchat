import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export interface CopyLinkProps {
  value: string;
  altText?: string;
}

export function CopyLink({ value, altText }: CopyLinkProps) {
  const [showTooltip, setShowTooltip]: [boolean, any] = useState(false);

  return (
    <>
      <OverlayTrigger
        placement="bottom"
        trigger="focus"
        overlay={
          <Tooltip id="button-tooltip" show={showTooltip}>
            Copied!
          </Tooltip>
        }
      >
        <a
          href="#"
          className="me-3 text-decoration-none d-flex align-items-center"
          onClick={() => {
            navigator.clipboard.writeText(value);
          }}
        >
          <i className="bi bi-clipboard-check"></i>
          &nbsp;
          <span className="text-truncate">{altText ? altText : value}</span>
        </a>
      </OverlayTrigger>
    </>
  );
}
