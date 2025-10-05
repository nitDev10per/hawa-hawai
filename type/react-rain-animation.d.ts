declare module "react-rain-animation" {
  import * as React from "react";

  interface RainProps {
    numDrops?: number;
    style?: React.CSSProperties;
  }

  export default class Rain extends React.Component<RainProps> {}
}
