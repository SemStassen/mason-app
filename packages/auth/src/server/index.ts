import { pool } from "@mason/db/server";
import { serverEnv } from "@mason/env/server";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  appName: "Mason",
  database: pool,
  trustedOrigins: ["http://localhost:8002"],
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
    },
  },
  user: {
    modelName: "users",
    fields: {
      name: "display_name",
      email: "email",
      emailVerified: "email_verified",
      image: "image_url",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      token: "session_token",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      scope: "scope",
      idToken: "id_token",
      password: "password",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      identifier: "identifier",
      value: "value",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  plugins: [
    organization({
      schema: {
        organization: {
          modelName: "workspaces",
          fields: {
            name: "name",
            slug: "slug",
            logo: "logo_url",
            metadata: "metadata",
            createdAt: "created_at",
            updatedAt: "updated_at",
          },
        },
        member: {
          modelName: "members",
          fields: {
            userId: "user_id",
            organizationId: "workspace_id",
            role: "role",
            createdAt: "created_at",
            updatedAt: "updated_at",
          },
        },
        invitation: {
          modelName: "invitations",
          fields: {
            inviterId: "inviter_id",
            organizationId: "workspace_id",
            email: "email",
            role: "role",
            status: "status",
            expiresAt: "expires_at",
            createdAt: "created_at",
            updatedAt: "updated_at",
          },
        },
        session: {
          fields: {
            activeOrganizationId: "active_workspace_id",
          },
        },
      },
    }),
  ],
});
