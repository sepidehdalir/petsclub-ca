import Link from "next/link";
import styles from "./kitchen.module.css";
export function KitchenBanner() { return <div className={styles.banner}><div><strong>A little love, from the kitchen.</strong><p>Simple, cooked treats and toppers. Small extras, not a replacement for a complete diet.</p></div><Link href="/kitchen" prefetch={false}>Explore Pet Kitchen ↗</Link></div>; }
