# ----------------------------------------------------------------------------------------------------------------------
# Load

FROM node:4.3.0

# ----------------------------------------------------------------------------------------------------------------------
# Install the NodeJs App

# Install app dependencies
COPY package.json /sequelize-mocking/package.json
COPY npm-shrinkwrap.json /sequelize-mocking/npm-shrinkwrap.json
RUN cd /sequelize-mocking; npm install

# Bundle app source (goal: check if the generated ES5 files work)
COPY ./lib-es5 /sequelize-mocking/lib
COPY ./test /sequelize-mocking/test

# ----------------------------------------------------------------------------------------------------------------------
# Run the application

WORKDIR /sequelize-mocking
CMD ["npm", "test"]
