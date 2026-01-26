import Link from 'next/link'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol
        className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            itemProp="item"
            className="hover:text-[var(--primary)]"
          >
            <span itemProp="name">홈</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((item, index) => (
          <li
            key={index}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center gap-2"
          >
            <span>/</span>
            {item.href ? (
              <Link
                href={item.href}
                itemProp="item"
                className="hover:text-[var(--primary)]"
              >
                <span itemProp="name">{item.name}</span>
              </Link>
            ) : (
              <span itemProp="name" className="text-[var(--foreground)]">
                {item.name}
              </span>
            )}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
