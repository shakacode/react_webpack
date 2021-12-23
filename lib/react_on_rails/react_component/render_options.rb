# frozen_string_literal: true

require "react_on_rails/utils"

module ReactOnRails
  module ReactComponent
    class RenderOptions
      include Utils::Required

      attr_accessor :request_digest

      NO_PROPS = {}.freeze

      # TODO: remove the required for named params
      def initialize(react_component_name: required("react_component_name"), options: required("options"))
        @react_component_name = react_component_name.camelize
        @options = options
      end

      attr_reader :react_component_name

      def throw_js_errors
        options.fetch(:throw_js_errors, false)
      end

      def props
        options.fetch(:props) { NO_PROPS }
      end

      def client_props
        extension_module_hash_config = retrieve_configuration_value_for(:client_props_extension)

        # TODO: raise error if extension_module is not nil || Hash
        return nil unless options[:props] && extension_module_hash_config

        # Get the Module and method from the config hash
        extension_module = extension_module_hash_config[:extensor_name].constantize
        extension_module_method = extension_module_hash_config[:method].to_sym

        # return the processed props
        begin
          extension_module.send(extension_module_method, react_component_name, options[:props])
        raise NameError
          puts "The module #{extension_module} provided at react_on_rails.rb config does not exist"
        raise NoMethodError
          puts "The method #{extension_module_method} does not exist in the module #{extension_module}. \n
                Make sure it is defined as self.my_method"
        end
      end

      def random_dom_id
        retrieve_configuration_value_for(:random_dom_id)
      end

      def dom_id
        @dom_id ||= options.fetch(:id) do
          if random_dom_id
            generate_unique_dom_id
          else
            base_dom_id
          end
        end
      end

      def random_dom_id?
        return false if options[:id]

        return false unless random_dom_id

        true
      end

      def html_options
        options[:html_options].to_h
      end

      def prerender
        retrieve_configuration_value_for(:prerender)
      end

      def trace
        retrieve_configuration_value_for(:trace)
      end

      def replay_console
        retrieve_configuration_value_for(:replay_console)
      end

      def raise_on_prerender_error
        retrieve_configuration_value_for(:raise_on_prerender_error)
      end

      def logging_on_server
        retrieve_configuration_value_for(:logging_on_server)
      end

      def to_s
        "{ react_component_name = #{react_component_name}, options = #{options}, request_digest = #{request_digest}"
      end

      def internal_option(key)
        options[key]
      end

      def set_option(key, value)
        options[key] = value
      end

      private

      attr_reader :options

      def base_dom_id
        "#{react_component_name}-react-component"
      end

      def generate_unique_dom_id
        "#{base_dom_id}-#{SecureRandom.uuid}"
      end

      def retrieve_configuration_value_for(key)
        options.fetch(key) do
          ReactOnRails.configuration.public_send(key)
        end
      end
    end
  end
end
