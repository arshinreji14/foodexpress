const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const menuItems = [
  {
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
    price: 8.99,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
    category: "Pizza",
  },
  {
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni and mozzarella cheese on a crispy crust.",
    price: 10.49,
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e",
    category: "Pizza",
  },
  {
    name: "Classic Cheeseburger",
    description: "Beef patty with cheddar cheese, lettuce, tomato, and special sauce.",
    price: 7.49,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    category: "Burgers",
  },
  {
    name: "Bacon Burger",
    description: "Juicy beef patty topped with crispy bacon and melted cheese.",
    price: 8.99,
    imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b",
    category: "Burgers",
  },
  {
    name: "Caesar Salad",
    description: "Crisp romaine lettuce, parmesan, croutons, and Caesar dressing.",
    price: 6.49,
    imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
    category: "Salads",
  },
  {
    name: "French Fries",
    description: "Golden, crispy fries seasoned with sea salt.",
    price: 3.49,
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
    category: "Sides",
  },
  {
    name: "Chicken Wings",
    description: "Spicy buffalo chicken wings served with ranch dip.",
    price: 7.99,
    imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f",
    category: "Appetizers",
  },
  {
    name: "Chocolate Milkshake",
    description: "Rich and creamy chocolate milkshake topped with whipped cream.",
    price: 4.99,
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699",
    category: "Beverages",
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();

  await prisma.menuItem.createMany({ data: menuItems });

  console.log(`Seeded ${menuItems.length} menu items.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
