#####################################################################
########### MAKE SURE TO CHANGE NODE TO RUN IN BACKGROUND ###########
#####################################################################

provider "aws" {
	"region" = "${var.region}"
	"access_key" = "${var.access_key}"
	"secret_key" = "${var.secret_key}"
}

resource "aws_instance" "web_server" {
	ami = "ami-4b133c5d"
	instance_type = "t2.micro"
	key_name = "fre"
	vpc_security_group_ids = ["${aws_security_group.web_server.id}"]

	tags {
		Name = "web_server"
	}

	provisioner "remote-exec" {
		script = "./provisioner.sh -a ${aws_instance.web_server.public_ip}"

		connection {
			user = "ubuntu"
			private_key = "${file("~/Downloads/fre.pem")}"
			type = "ssh"
		}
	}
}

resource "aws_security_group" "web_server" {
	name = "web_server"

	ingress {
		from_port = 0
		to_port = 0
		protocol = -1
		cidr_blocks = ["0.0.0.0/0"]
	}

	egress {
		from_port = 0
		to_port = 0
		protocol = -1
		cidr_blocks = ["0.0.0.0/0"]
	}
}

output "web_server_ip" {
	value = "${aws_instance.web_server.public_ip}"
}