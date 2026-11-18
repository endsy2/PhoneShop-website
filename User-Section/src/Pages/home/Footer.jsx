import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { logo } from "../Assets/image";

const CONTACT = [
  { icon: FiMapPin, text: "សង្កាត់ទឹកល្អក១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ" },
  { icon: FiPhone, text: "096 888 750", href: "tel:096888750" },
  { icon: FiMail, text: "GeniusStore168@gmail.com", href: "mailto:GeniusStore168@gmail.com" },
];

const Footer = () => (
  <div id="contact" className="mt-20 border-t border-line bg-surface">
    <div className="page-container grid gap-10 py-12 md:grid-cols-[1.2fr_1fr]">
      <div className="max-w-sm">
        <img src={logo} alt="Genius Store" className="h-8 w-auto" />
        <p className="mt-4 text-sm leading-6 text-ink-2">
          A phone shop in Phnom Penh. We sell smartphones, smartwatches, tablets and accessories, and buy used devices.
        </p>
      </div>
      <div>
        <h2 className="text-sm font-medium text-ink">Contact</h2>
        <ul className="mt-4 space-y-3">
          {CONTACT.map(({ icon: Icon, text, href }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-ink-2">
              <Icon size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-3" />
              {href ? <a href={href} className="hover:text-ink">{text}</a> : <span>{text}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="border-t border-line">
      <div className="page-container flex h-14 items-center justify-between text-[13px] text-ink-3">
        <span>© {new Date().getFullYear()} Genius Store</span>
        <span>Cash on delivery · Bakong KHQR</span>
      </div>
    </div>
  </div>
);

export default Footer;
