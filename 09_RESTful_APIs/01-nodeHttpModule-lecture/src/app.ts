import http, {
	type RequestListener,
	type ServerResponse,
	type IncomingMessage
} from 'node:http';
import '#db';
import { User } from '#models';

type UserInputType = {
	firstName: string;
	lastName: string;
	email: string;
};

const createResponse = (
	res: ServerResponse,
	statusCode: number,
	message: unknown
) => {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	return res.end(
		typeof message === 'string'
			? JSON.stringify({ message })
			: JSON.stringify(message)
	);
};

const parseJsonBody = <T>(req: IncomingMessage): Promise<T> => {
	return new Promise((resolve, reject) => {
		let body = '';
		req.on('data', (chunk) => {
			// console.log(chunk);
			body += chunk.toString();
		});

		req.on('end', async () => {
			try {
				resolve(JSON.parse(body) as T);
			} catch (error) {
				reject(new Error('Invalid JSON'));
			}
		});
	});
};

const requestHandler: RequestListener = async (req, res) => {
	const { method, url } = req;
	const singleUserRegex = /^\/users\/[0-9a-zA-Z]+$/;
	// console.log(method, url);

	if (url === '/users') {
		if (method === 'GET') {
			const users = await User.find();
			console.log(users);
			return createResponse(res, 200, users);
		}
		if (method === 'POST') {
			const body = await parseJsonBody<UserInputType>(req);
			console.log(body);
			const newUser = await User.create(body);
			return createResponse(res, 201, newUser);
		}
		return createResponse(res, 405, 'Method not allowed');
	}

	if (singleUserRegex.test(url!)) {
		if (method === 'GET') {
			return createResponse(res, 200, `GET request on ${url}`);
		}
		if (method === 'PUT') {
			return createResponse(res, 201, `PUT request on ${url}`);
		}
		if (method === 'DELETE') {
			return createResponse(res, 201, `DELETE request on ${url}`);
		}
		return createResponse(res, 405, 'Method not allowed');
	}

	return createResponse(res, 404, 'Not Found');
};

const server = http.createServer(requestHandler);

const port = 3000;

server.listen(port, () =>
	console.log(`Server running on http://localhost:${port}/`)
);
