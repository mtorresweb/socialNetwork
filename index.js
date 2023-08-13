const express = require('express');
const connection = require('./database/connection.js');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middlewares/errorHandler.js');
const { NotFoundError } = require('./utils/errors.js');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Security configuration
app.use(
  cors({
    origin: '*',
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: [
          "'self'",
          "'strict-dynamic'",
          "'nonce-rAnd0m123'",
          "'unsafe-inline'",
          "'unsafe-eval'",
        ],
        requireTrustedTypesFor: ['script'],
      },
    },
  })
);

//allowed data types
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connection();

//route configuration
const userRoutes = require('./routes/user.js');
const followRoutes = require('./routes/follow.js');
const publicationRoutes = require('./routes/publication.js');

app.use('/api/user', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/publication', publicationRoutes);

//Not found middleware
app.use('*', (req, res, next) => next(new NotFoundError(req.path)));

//Error middleware
app.use(errorHandler);

const port = process.env.PORT;
app.listen(port, () => console.log(`app listening on port ${port}!`));
