import type { ReactNode } from 'react';

interface FrameProps {
  caption: ReactNode;
  captionEnd?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Captioned, bordered box used for every illustration on the page. */
export default function Frame({ caption, captionEnd, footer, className, children }: FrameProps) {
  return (
    <div className={className ? `frame ${className}` : 'frame'}>
      <div className="frame-cap">
        <span>{caption}</span>
        {captionEnd ? <span>{captionEnd}</span> : null}
      </div>
      <div className="frame-box">{children}</div>
      {footer ? <div className="frame-cap frame-cap-foot">{footer}</div> : null}
    </div>
  );
}
