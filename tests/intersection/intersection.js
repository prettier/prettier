export type ReallyBigSocketServer = ReallyBigSocketServerInterface & ReallyBigSocketServerStatics;

type Props = {
  focusedChildren?: React.Children,
  onClick: () => void,
  overlayChildren?: React.Children,
  style?: Object,
  thumbnail: ImageSource,
} & FooterProps;
