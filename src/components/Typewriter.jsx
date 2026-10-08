import { useTypewriter } from '../hooks/useTypewriter';

export default function Typewriter() {
  const text = useTypewriter();

  return (
    <div className="type-line">
      <span id="typewriter">{text}</span>
      <span className="caret"></span>
    </div>
  );
}
