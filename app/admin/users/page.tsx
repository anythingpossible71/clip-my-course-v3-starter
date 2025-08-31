import { prisma } from "@/lib/prisma";
import { UserManagementPanel } from "@/components/admin/UserManagementPanel";
import { getCurrentUser } from "@/lib/auth/permissions";
import { encodeId } from "@/lib/utils/sqids";
import { transformUserForResponse } from "@/lib/utils/api-transforms";
const ITEMS_PER_PAGE = 10;

async function getRoles() {
  return prisma.role.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      id: "asc",
    },
  });
}

async function getUsers(page: number = 1, search?: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where = {
    deleted_at: null,
    ...(search && {
      email: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const [users, count] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { created_at: "desc" },
      include: {
        profile: true,
        roles: {
          where: {
            deleted_at: null,
          },
          include: {
            role: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, count };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search;

  const [{ users, count }, currentUser, roles] = await Promise.all([
    getUsers(page, search),
    getCurrentUser(),
    getRoles(),
  ]);

  // Transform users to use encoded IDs for client, but keep numeric ID for display
  const transformedUsers = users.map(user => ({
    ...transformUserForResponse(user),
    numericId: user.id // Keep the original numeric ID for display
  }));

  // Transform roles to use encoded IDs
  const transformedRoles = roles.map((role) => ({
    ...role,
    id: encodeId(role.id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <UserManagementPanel
        initialUsers={transformedUsers}
        totalCount={count}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        currentUserId={currentUser ? encodeId(currentUser.id) : ""}
        availableRoles={transformedRoles}
      />
    </div>
  );
}
