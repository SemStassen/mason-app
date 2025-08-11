import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';
import { CreateWorkspaceRequest } from '~/models/workspace.model';
import { InternalServerError } from '../error';

export const WorkspaceGroup = HttpApiGroup.make('Workspace').add(
  HttpApiEndpoint.post('CreateWorkspace')`/workspace`
    .setPayload(CreateWorkspaceRequest)
    .addSuccess(Schema.Struct({}))
    .addError(InternalServerError)
);
