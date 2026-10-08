const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer>
      © <span id="year">{CURRENT_YEAR}</span> Jun Fenequito
    </footer>
  );
}
