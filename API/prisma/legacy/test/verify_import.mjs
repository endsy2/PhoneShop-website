// Checks import_from_legacy.sql against legacy_fixture.sql. Run against a THROWAWAY database:
//   1. load legacy_fixture.sql (creates `phone_shop`), create an empty `phoneshop` db
//   2. DATABASE_URL=mysql://.../phoneshop npx prisma migrate deploy
//   3. sed 's/LEGACY_DB/phone_shop/g' ../import_from_legacy.sql | mysql phoneshop
//   4. DATABASE_URL=mysql://.../phoneshop node prisma/legacy/test/verify_import.mjs
import assert from "node:assert/strict";
import prisma from "../../../db/prisma.js";

const p = await prisma.product.findUnique({
  where: { id: 10 },
  include: { brand: true, colors: { include: { images: { orderBy: { sortOrder: "asc" } }, variants: true } } },
});
assert.equal(p.brand.name, "Apple");
assert.equal(p.screenSizeIn.toString(), "6.1");
assert.equal(p.batteryMah, 3349);
const black = p.colors.find((c) => c.name === "Black");
assert.deepEqual(black.images.map((i) => i.url), ["a1.jpg", "b2.jpg"]);
assert.deepEqual(black.variants.map((v) => v.storageGb).sort((a, b) => a - b), [128, 1024]); // "1TB" -> 1024
assert.equal((await prisma.product.findUnique({ where: { id: 11 } })).screenSizeIn.toString(), "6.2");
assert.equal(await prisma.productImage.count(), 3); // orphan image dropped

const admin = await prisma.user.findFirst({ where: { role: "admin" } });
assert.equal(admin.id, 3); // admin_id 1 + max customer id 2
assert.equal((await prisma.user.findUnique({ where: { id: 4 } })).role, "support"); // staff role carried over
const msgs = await prisma.chatMessage.findMany({ include: { sender: true }, orderBy: { id: "asc" } });
assert.deepEqual(msgs.map((m) => m.sender.role), ["customer", "admin"]);
assert.ok(msgs[0].readAt && !msgs[1].readAt);

const reviews = await prisma.review.findMany();
assert.equal(reviews.length, 2); // two reviews of the same product by one user collapse to the latest
assert.equal(reviews.find((r) => r.userId === 1).title, "newer");
assert.equal(await prisma.reviewVote.count(), 1);

const [o1, o2] = await prisma.order.findMany({ include: { items: true }, orderBy: { id: "asc" } });
assert.equal(o1.total.toString(), "1598");
assert.equal(o1.paymentMethod, "bakong_qr");
assert.equal(o1.paymentStatus, "paid");
assert.equal(o1.items[0].unitPrice.toString(), "799");
assert.equal(o1.items[0].productName, "iPhone 15");
assert.equal(o2.total.toString(), "899.99"); // amount NULL -> price * qty
assert.equal(o2.recipientName, "bob");
assert.equal(o2.paymentMethod, "cash_on_delivery");

const promo = await prisma.promotion.findFirst();
assert.equal(promo.endsAt.toISOString().slice(11, 19), "23:59:59");
assert.equal(await prisma.address.count(), 1);

// CHECK constraints from the migration
await assert.rejects(prisma.review.create({ data: { productId: 11, userId: 1, rating: 6 } }));
await assert.rejects(prisma.productVariant.update({ where: { id: 33 }, data: { reservedStock: 99 } }));

// auto-increment continues after imported ids
const v = await prisma.productVariant.create({ data: { colorId: 22, ramGb: 12, storageGb: 512, price: "999.00", stock: 2 } });
assert.equal(v.id, 34);

console.log("import verified");
await prisma.$disconnect();
