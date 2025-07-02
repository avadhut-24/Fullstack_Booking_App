export default function Image({src,...rest}) {
  src = src && src.includes('https://')
    ? src
    : src;
  return (
    <img {...rest} src={src} alt={''} />
  );
}