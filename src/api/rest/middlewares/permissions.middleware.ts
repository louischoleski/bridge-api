import { Request, Response, NextFunction } from 'express';

/**
 * Permission types for different resources
 */
export enum Permission {
  // Product permissions
  PRODUCT_READ = 'product:read',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',

  // Cart permissions
  CART_READ = 'cart:read',
  CART_WRITE = 'cart:write',

  // Order permissions
  ORDER_READ = 'order:read',
  ORDER_CREATE = 'order:create',
  ORDER_UPDATE = 'order:update',
  ORDER_DELETE = 'order:delete',

  // Admin permissions
  ADMIN_ALL = 'admin:all',
}

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    Permission.ADMIN_ALL,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.CART_READ,
    Permission.CART_WRITE,
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
  ],
  customer: [
    Permission.PRODUCT_READ,
    Permission.CART_READ,
    Permission.CART_WRITE,
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
  ],
  'product-manager': [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
  ],
  'order-manager': [
    Permission.PRODUCT_READ,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
  ],
  guest: [Permission.PRODUCT_READ],
};

/**
 * Get all permissions for a user based on their roles
 */
export function getUserPermissions(roles: string[]): Permission[] {
  const permissions = new Set<Permission>();

  roles.forEach((role) => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach((permission) => permissions.add(permission));
  });

  return Array.from(permissions);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userRoles: string[],
  requiredPermission: Permission
): boolean {
  const userPermissions = getUserPermissions(userRoles);

  // Admin has all permissions
  if (userPermissions.includes(Permission.ADMIN_ALL)) {
    return true;
  }

  return userPermissions.includes(requiredPermission);
}

/**
 * Middleware factory to check if user has required permission
 */
export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
          statusCode: 401,
        },
      });
      return;
    }

    // Check if user has at least one of the required permissions
    const hasRequiredPermission = requiredPermissions.some((permission) =>
      hasPermission(req.user!.roles, permission)
    );

    if (!hasRequiredPermission) {
      res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          statusCode: 403,
          details: {
            required: requiredPermissions,
            userRoles: req.user.roles,
          },
        },
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user can perform CRUD operation on a resource
 */
export const canRead = (resource: 'product' | 'cart' | 'order') => {
  const permissionMap = {
    product: Permission.PRODUCT_READ,
    cart: Permission.CART_READ,
    order: Permission.ORDER_READ,
  };
  return requirePermission(permissionMap[resource]);
};

export const canCreate = (resource: 'product' | 'cart' | 'order') => {
  const permissionMap = {
    product: Permission.PRODUCT_CREATE,
    cart: Permission.CART_WRITE,
    order: Permission.ORDER_CREATE,
  };
  return requirePermission(permissionMap[resource]);
};

export const canUpdate = (resource: 'product' | 'cart' | 'order') => {
  const permissionMap = {
    product: Permission.PRODUCT_UPDATE,
    cart: Permission.CART_WRITE,
    order: Permission.ORDER_UPDATE,
  };
  return requirePermission(permissionMap[resource]);
};

export const canDelete = (resource: 'product' | 'cart' | 'order') => {
  const permissionMap = {
    product: Permission.PRODUCT_DELETE,
    cart: Permission.CART_WRITE,
    order: Permission.ORDER_DELETE,
  };
  return requirePermission(permissionMap[resource]);
};
